import nodemailer from 'nodemailer'

export async function sendEmailAccess({to,subject,message,attachments=[]}={}) {
    const transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: 'YourEmail@gmail.com', //Email To Send From 
            pass: '',
        },
        tls:{rejectUnauthorized:false}
    }) 

 const emailinFormation =await transporter.sendMail({
    from :'"Ecomm App" <YourEmail@gmail.com>',
    to:to ? to: '',
    html:message ? message : '',
    subject:subject ? subject : '',
    attachments
})
if(emailinFormation.accepted.length){
    return true
}
return false

}