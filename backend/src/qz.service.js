const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const certificateDirectory = path.join(
  process.env.PROGRAMDATA || 'C:\\ProgramData',
  'AshRaya Software Solutions',
  'Customer Billing',
  'certificates',
);

const certificatePath = path.join(certificateDirectory, 'digital-certificate.txt');

const privateKeyPath = path.join(certificateDirectory, 'private-key.pem');

if (!fs.existsSync(certificatePath)) {
  throw new Error(`QZ certificate not found: ${certificatePath}`);
}

if (!fs.existsSync(privateKeyPath)) {
  throw new Error(`QZ private key not found: ${privateKeyPath}`);
}

const certificate = fs.readFileSync(certificatePath, 'utf8');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const sign = (data) => {
  const signer = crypto.createSign('SHA256');

  signer.update(data);
  signer.end();

  return signer.sign(privateKey, 'base64');
};

const getCertificate = () => certificate;

module.exports = {
  sign,
  getCertificate,
};

console.log('QZ signing service loaded successfully');
