import UserRepository from "../repositories/UserRepository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthController {

  async register(req, res) {
    try {
      const { name, petName, email, password } = req.body;

      if (!name || !petName || !email || !password) {
        return res.status(400).json({ error: "Dados obrigatórios faltando" });
      }

      const userExists = await UserRepository.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await UserRepository.create({
        name,
        petName,
        email,
        password: hashedPassword
      });

      return res.status(201).json({
        message: "Usuário criado com sucesso"
      });

    } catch (err) {
      console.error("Erro no register:", err);
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email, {
        withPassword: true
      });

      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          name: user.name,
          petName: user.petName,
          email: user.email
        }
      });

    } catch (err) {
      console.error("Erro no login:", err);
      return res.status(500).json({ error: "Erro no login" });
    }
  }
}

export default new AuthController();
