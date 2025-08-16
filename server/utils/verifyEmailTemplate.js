const verifyEmailTemplate = ({ name, code }) => {

    return `
    <h1>Dear ${name}</h1>
    <p>You ask for verification code.<p/>
    <h2>${code}<h2/>
    <p>Thank you for registering with us.</p>
    `
}

export default verifyEmailTemplate