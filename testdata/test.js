import Vault from '../classes/Vault';
import VM from '../classes/VaultManager';

describe('Vault Class', () => {
  it('prints the vault name', () => {
    // Mock console.log to test its output
    const logMock = jest.spyOn(console, 'log').mockImplementation();
 
    const vault = new Vault('MainVault');
    vault.printName();

    // Ensure console.log was called with the expected output
    expect(logMock).toHaveBeenCalledWith('Vault Name: MainVault');

    // Clean up
    logMock.mockRestore();
  });
});