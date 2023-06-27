import emailJs from "@emailjs/browser";

export default {
  sendEmail(emailList, subject, body) {
    var emailObject = {
        email_to: emailList,
        email_subject: subject,
        email_message: body,
    };
    emailJs.init('2tq8FLLEBgqhzfv3V');
    return emailJs.send("service_1o0wfbp","template_6pxk0ey", emailObject);    
  },
};
