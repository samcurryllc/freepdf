import forge from 'node-forge'

export interface CertificateInfo {
  commonName: string
  email: string
  organization?: string
  country?: string
}

export interface GeneratedCertificate {
  certificate: string // PEM
  privateKey: string // PEM
  fingerprint: string
}

export function generateSelfSignedCertificate(info: CertificateInfo): GeneratedCertificate {
  const keys = forge.pki.rsa.generateKeyPair(2048)
  const cert = forge.pki.createCertificate()

  cert.publicKey = keys.publicKey
  cert.serialNumber = '01' + forge.util.bytesToHex(forge.random.getBytesSync(8))

  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

  const attrs = [
    { name: 'commonName', value: info.commonName },
    { name: 'emailAddress', value: info.email },
  ]
  if (info.organization) attrs.push({ name: 'organizationName', value: info.organization })
  if (info.country) attrs.push({ name: 'countryName', value: info.country })

  cert.setSubject(attrs)
  cert.setIssuer(attrs) // Self-signed
  cert.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, nonRepudiation: true },
    { name: 'subjectAltName', altNames: [{ type: 1, value: info.email }] },
  ])

  cert.sign(keys.privateKey, forge.md.sha256.create())

  const pem = forge.pki.certificateToPem(cert)
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey)
  const fingerprint = forge.md.sha256.create().update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()).digest().toHex()

  return {
    certificate: pem,
    privateKey: keyPem,
    fingerprint: fingerprint.match(/.{2}/g)!.join(':').toUpperCase(),
  }
}

export function signData(data: string, privateKeyPem: string): string {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
  const md = forge.md.sha256.create()
  md.update(data, 'utf8')
  const signature = privateKey.sign(md)
  return forge.util.encode64(signature)
}

export async function computeDocumentHash(bytes: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
