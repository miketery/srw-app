from base64 import b64decode, b64encode
import json
import logging
import requests
import time
from typing import TypedDict

from base58 import b58decode, b58encode
from nacl.signing import VerifyKey, SigningKey, SignedMessage
from nacl.public import PrivateKey, PublicKey, Box, SealedBox

from .config import debug
from .utils import verify_signed_payload, create_signed_payload, b58encodeKey

REGISTER_ENDPOINT = "/api/user/register/"  # register using DID
DELETE_ENDPOINT = "/api/user/delete/"  # delete
LOOKUP_ENDPOINT = "/api/user/verify_key/"  # lookup a user using DID

MESSAGES_POST_ENDPOINT = "/api/message/post/"
MESSAGES_GET_ENDPOINT = "/api/message/get/"

# logger
if debug:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

class DID:
    def __init__(self, did: str) -> None:
        self.did = did
        self.verify_key = None
        self.public_key = None
        self.name = None
        self.metadata = None

    def __str__(self) -> str:
        return self.did

    def lookup(self, host: str, signing_key: SigningKey):
        url = f"http://{host}{LOOKUP_ENDPOINT}"
        payload = {
            'verify_key': self.did.split(':')[-1],
            'sig_ts': int(time.time())  # unix timestamp
        }
        signed_payload = create_signed_payload(payload, signing_key)
        r = requests.post(url, json=signed_payload)
        logger.debug([r.status_code, r.content])
        if r.status_code == 200:
            logger.info(f"Successfully looked up user {self.did}")
            data = json.loads(r.content)
            self.verify_key = data['verify_key']
            self.public_key = data['public_key']
            self.name = data['name']
            # self.metadata = data['metadata']
            return True
        else:
            logger.error(f"Failed to look up user {self.did}")
            return False
    
    def toDict(self):
        return {
            'did': self.did,
            'verify_key': self.verify_key,
            'public_key': self.public_key,
            'name': self.name,
            'metadata': self.metadata
        }

class SenderDict(TypedDict):
    did: str
    verify_key: str
    public_key: str
    name: str

class ReceiverDict(SenderDict):
    pass

class MessageDict(TypedDict):
    sender: SenderDict
    receiver: ReceiverDict
    encryption: str
    data: dict|bytes
    type_name: str
    type_version: str
    sig_ts: int

class SignedPayloadDict(TypedDict):
    signed: str  # this will have the message dict as a byte encoded string
    signature: str

class Sender:
    did: DID
    verify_key: VerifyKey
    public_key: PublicKey
    name: str
    def __init__(self, did: str, verify_key: VerifyKey, public_key: PublicKey, name: str) -> None:
        self.did = DID(did)
        self.verify_key = verify_key
        self.public_key = public_key
        self.name = name
    def __str__(self) -> str:
        return json.dumps(self.toDict(), indent=4)
    def toDict(self) -> SenderDict:
        return {
            'did': str(self.did),
            'verify_key': b58encodeKey(self.verify_key),
            'public_key': b58encodeKey(self.public_key),
            'name': self.name
        }
    @staticmethod
    def fromVault(vault):
        return Sender(
            vault.did,
            vault.verify_key,
            vault.public_key,
            vault.name
        )

class Receiver(Sender):
    pass

class Message:
    def __init__(self, 
                 sender: Sender|None,
                 receiver: Receiver,
                 data: dict|bytes,
                 type_name: str,
                 type_version: str,
                 encryption: str=None,
                 encrypt: bool=True,
                 sig_ts: int=0) -> None:
        self.sender = sender
        self.receiver = receiver
        self.data = data
        self.type_name = type_name
        self.type_version = type_version
        self.sig_ts = 0 # will be set by SignedPayload class
        self.encrypt = encrypt
        self.encryption = encryption
        self.decrypted = None

    def decrypt(self, receiver_private_key: PrivateKey, sender_public_key: PublicKey|None):
        if self.encryption == 'X25519Box':
            if sender_public_key is None:
                raise Exception("Sender public key required to decrypt")
            data_bytes = Box(receiver_private_key, sender_public_key).decrypt(self.data)
            self.decrypted = json.loads(data_bytes.decode('utf-8'))
        elif self.encryption == 'X25519SealedBox':
            data_bytes = SealedBox(receiver_private_key).decrypt(self.data)
            self.decrypted = json.loads(data_bytes.decode('utf-8'))
        return True

    def encryptSealedBox(self):
        data_bytes = json.dumps(self.data).encode('utf-8')
        self.encrypted = SealedBox(self.receiver.public_key).encrypt(data_bytes)
        self.encryption = 'X25519SealedBox'

    def encryptBox(self, sender_private_key: PrivateKey):
        data_bytes = json.dumps(self.data).encode('utf-8')
        self.encrypted = Box(sender_private_key, self.receiver.public_key).encrypt(data_bytes)
        self.encryption = 'X25519Box'

    def outboundFinal(self) -> MessageDict:
        if self.encrypt and self.encryption is None:
            raise Exception("Encrypt set to true but not yet encrypted")
        return {
            'sender': self.sender.toDict(),
            'receiver': self.receiver.toDict(),
            'encryption': self.encryption,
            'data': b64encode(self.encrypted).decode('utf-8') 
                if self.encrypt else self.data,
            'type_name': self.type_name,
            'type_version': self.type_version,
            'sig_ts': 0 # will be set by SignedPayload class
        }
    
    @staticmethod
    def inbound(message: MessageDict):
        return Message(
            Sender(
                message['sender']['did'],
                VerifyKey(b58decode(message['sender']['verify_key'])),
                PublicKey(b58decode(message['sender']['public_key'])),
                message['sender']['name']
            ),
            Receiver(
                message['receiver']['did'],
                VerifyKey(b58decode(message['receiver']['verify_key'])),
                PublicKey(b58decode(message['receiver']['public_key'])),
                message['receiver']['name']
            ),
            b64decode(message['data']) if message['encryption'] else message['data'],
            message['type_name'],
            message['type_version'],
            message['encryption'] if message['encryption'] else None,
            encrypt=True if message['encryption'] else False,
            sig_ts=message['sig_ts']
        )

class SignedPayload:
    verified: bool
    def __init__(self,
                 payload: MessageDict|None,
                 signed: SignedMessage|None,
                 verify_key: VerifyKey|None) -> None:
        self.payload = payload
        self.signed = signed
        self.verify_key = verify_key
        self.verified = False
        if self.signed:
            self.verify()
            self.verified = True

    def sign(self, signing_key: SigningKey):
        payload = {
            'sender': self.payload['sender'].toDict(),
            'receiver': self.payload['receiver'].toDict(),
            'encryption': self.payload['encryption'],
            'data': self.payload['data'],
            'type_name': self.payload['type_name'],
            'type_version': self.payload['type_version'],
            'sig_ts': int(time.time())  # unix timestamp
        }
        payload_bytes = json.dumps(payload).encode('utf-8')
        self.signed: SignedMessage = signing_key.sign(payload_bytes)
        self.verify_key = signing_key.verify_key
        return True

    def verify(self):
        return self.verify_key.verify(self.signed)

    def decrypt(self, receiver_private_key: str):
        pass

    def outboundFinal(self) -> SignedPayloadDict:
        return {
            'signed': b64encode(self.signed).decode('utf-8'),
            'verify_key': b58encodeKey(self.verify_key)
        }
    @staticmethod
    def inbound(payload: SignedPayloadDict):
        return SignedPayload(
            None,
            b64decode(payload['signed']),
            VerifyKey(b58decode(payload['verify_key']))
        )

class DAS:
    host: str
    def __init__(self, vault) -> None:
        self.vault = vault
        self.host = vault.digital_agent_host

    def sender(self) -> SenderDict:
        # given vault generate sender Dict
        return {
            'did': self.vault.did,
            'verify_key': self.vault.b58_verify_key,
            'public_key': self.vault.b58_public_key,
            'name': self.vault.name,
            'metadata': None
        }
    
    def receiver(self, did: str) -> ReceiverDict:
        # try to find contact in vault
        # if not found lookup
        # given did lookup verify_key and public_key
        try:
            contact = self.vault.contact_manager.get_contact(did, raise_exception=True)
            logger.info(f"Contact {did} found in vault {self.vault.name}")
            return {
                'did': contact.did,
                'verify_key': contact.b58_verify_key,
                'public_key': contact.b58_public_key,
                'name': contact.name,
            }
        except Exception as e:
            logger.info(e)
            logger.info(f"Contact {did} not found in vault {self.vault.name}")
            receiver = DID(did)
            receiver.lookup(self.host, self.vault.signing_key)
            return {
                'did': receiver.did,
                'verify_key': receiver.verify_key,
                'public_key': receiver.public_key,
                'name': receiver.name,
            }
        

    def register_vault(self):
        url = f"http://{self.host}{REGISTER_ENDPOINT}"
        signature = self.vault.sign(bytes(self.vault.private_key.public_key)).signature
        data = {
            'uuid': self.vault.uuid,
            'name': self.vault.name,
            'display_name': self.vault.display_name,
            'email': self.vault.email,
            'public_key': self.vault.b58_public_key,
            'public_key_signature': signature.hex(),
            'verify_key': self.vault.b58_verify_key,
            'sig_ts': int(time.time())  # unix timestamp
        }
        signed_payload = create_signed_payload(data, self.vault.signing_key)
        r = requests.post(url, json=signed_payload)
        logger.debug([r.status_code, r.content])
        if r.status_code == 200:
            logger.info(f"Successfully registered vault {self.vault.name} with digital agent {self.host}")
            return True
        else:
            logger.error(f"Failed to register vault {self.vault.name} with digital agent {self.host}")
            return False

    def send_message(self, to_verify_key, to_public_key, data: dict|bytes, type_name=None, type_version=None):
        url = f"http://{self.host}{MESSAGES_POST_ENDPOINT}"
        if isinstance(data, dict):
            data = json.dumps(data).encode('utf-8')
        payload = {
            'verify_key': to_verify_key, # to who
            'public_key': to_public_key,
            'data': b64encode(data).decode('utf-8'),
             # data.encode('utf-8'),
            'sig_ts': int(time.time())  # unix timestamp
        }
        # if have type name and type version populate in payload
        if type_name:
            payload['type_name'] = type_name
        if type_version:
            payload['type_version'] = type_version
        signed_payload = create_signed_payload(payload, self.vault.signing_key)
        r = requests.post(url, json=signed_payload)
        logger.debug([r.status_code, r.content])
        if r.status_code == 201:
            logger.info(f"Successfully sent message to {to_verify_key}")
            return True
        else:
            logger.error(f"Failed to send message to {to_verify_key}")
            return False
    
    def get_messages(self, last=None):
        url = f"http://{self.host}{MESSAGES_GET_ENDPOINT}"
        payload = {
            'last': last
        }
        signed_payload = create_signed_payload(payload, self.vault.signing_key)
        r = requests.post(url, json=signed_payload)
        logger.debug([r.status_code, r.content])
        if r.status_code == 200:
            logger.info(f"Successfully retrieved messages")
            return json.loads(r.content)
        else:
            logger.error(f"Failed to retrieve messages")
            return None
        
    def delete_vault(self):
        url = f"http://{self.host}{DELETE_ENDPOINT}"
        payload = {
            'sig_ts': int(time.time())  # unix timestamp
        }
        signed_payload = create_signed_payload(payload, self.vault.signing_key)
        r = requests.post(url, json=signed_payload)
        logger.debug([r.status_code, r.content])
        if r.status_code == 200:
            logger.info(f"Successfully deleted vault {self.vault.name} from digital agent {self.host}")
            return True
        else:
            logger.error(f"Failed to delete vault {self.vault.name} from digital agent {self.host}")
            return False
