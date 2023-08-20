// A class to interface with the django model
// credentials.models.Template
//
// Path: client/classes/Template.ts

import axios from 'axios'
import { ENDPOINTS } from '../config'

enum FieldType {
    STRING = 'string',
    INTEGER = 'integer',
    DECIMAL = 'decimal',
    DATETIME = 'datetime',
    DATE = 'date',
    TIME = 'time',
    BOOLEAN = 'boolean',
    LIST = 'list',
    TUPLE = 'tuple',
    DICT = 'dict',
}

interface FieldData {
    // needs to match credentials.models.TemplateField
    uuid: string;
    name: string;
    description: string;
    type: FieldType;
    required: boolean;
    changeable: boolean;
}

interface TemplateData {
    // needs to match credentials.models.Template
    uuid: string;
    name: string;
    description: string;
    public: boolean;
    owner: {
        uuid: string,
        name: string,
        type: string,
    },
    type: string;
    fields: Array<FieldData>;
}

export default class Template {
    private static cache: Map<string, TemplateData> = new Map();

    // uuid: string;
    // name: string;
    // description: string;
    // public: boolean;
    // owner: {
    //     uuid: string,
    //     name: string,
    //     type: string,
    // };
    // type: string;
    // fields: Array<FieldData>;

    // constructor(data: TemplateData) {
    //     this.uuid = data.uuid;
    //     this.name = data.name;
    //     this.description = data.description;
    //     this.public = data.public;
    //     this.owner = data.owner;
    //     this.type = data.type;
    //     this.fields = data.fields;
    // }
    constructor() {}

    static async get(uuid: string, forceFetch: boolean = false): Promise<TemplateData> {
        return axios.get(ENDPOINTS.template(uuid))
            .then(response => {
            return response.data;
        }).catch(error => {
            console.log(error);
            throw(error);
        });
    }
    static async getOrgTemplates(uuid: string, forceFetch: boolean = false): Promise<Array<TemplateData>> {
        return axios.get(ENDPOINTS.templates_by_org(uuid)).then(response => {
            return response.data;
        }).catch(error => {
            console.log(error);
            throw(error);
        })
    }
    // static async getTemplate(uuid: string) {
    //     const response = await axios.get(`${ENDPOINTS.TEMPLATES}/${uuid}`);
    //     return new Template(response.data);
    // }
}
