const express = require("express");
const path = require("path");
const User = require("../model/user");
const router = express.Router();
const { upload } = require("../multer");
const ErrorHandler = require("../utils/error-handler");
const fs = require("fs");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      // Usuario ya existe, lanzar el error
      throw new ErrorHandler("User already exists", 400);
    }

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: {
        public_id: req.file.filename,
        url: req.file.path,
      },
    };

    const newUser = await User.create(user);

    res.status(201).json({
      success: true,
      newUser,
    });
  } catch (error) {
    // Lanzar el error
    console.error("Error creating user:", error);

    // Eliminar la imagen si la carga falla
    const filename = req.file.filename;
    const filePath = `uploads/${filename}`;

    console.log("Attempting to delete file at path:", filePath);

    try {
      // Intentar eliminar el archivo
      await fs.promises.unlink(filePath);
      console.log("File deleted successfully");
    } catch (deleteError) {
      // Manejar el error si no se puede eliminar el archivo
      console.error("Error deleting file:", deleteError);
    }

    // Lanzar el error después de intentar eliminar el archivo
    next(error);
  }
});

module.exports = router;
