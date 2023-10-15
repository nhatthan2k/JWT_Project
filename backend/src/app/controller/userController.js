const User = require("../model/User");

const userController = {
    
    // GET ALL USER
    getAllUser: async (req, res) => {
        try{
            const user = await User.find();
            res.status(200).json(user);
        }
        catch (err) {
            res.status(500).json(err);
        }
    },
    
    // DELETE USER
    deleteUser: async (req, res) => {
        try{
            const user = await User.findById(req.params.id);
            res.status(200).json('delete successfully');
        }
        catch (err) {
            res.status(500).json(err);
        }
    },
}

module.exports = userController;