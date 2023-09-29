import messagesModel from "../models/messages.js";

export default class MessageManager {
    getMessages = async () => {
        try {
            return await messagesModel.find().lean().exec();
        } catch (err) {
            return err;
        }
    };

    createMessage = async (message) => {
        try {
            return await messagesModel.create(message);
        } catch (err) {
            return err;
        }
    };
}
