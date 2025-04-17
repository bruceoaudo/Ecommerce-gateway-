import { Request, Response, Router } from "express";
import { authClient, LoginUserRequest, RegisterUserRequest } from "../client/authClient";

const router = Router()

router.post('/register', (req: Request, res: Response) => {
    (async () => {
        try {
          const request: RegisterUserRequest = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
          };

          const response = await authClient.registerUser(request);

          res.json(response);
        } catch (error) {
          console.error("Registration error:", error);
          res.status(500).json({
            success: false,
            message: "Registration failed",
          });
        }
        
    })()
})

router.post("/login", (req: Request, res: Response) => {
    (async () => {
        try {
          const request: LoginUserRequest = {
            email: req.body.email,
            password: req.body.password
          };

          const response = await authClient.loginUser(request);

          res.cookie("token", response.token, {
            httpOnly: true, // Prevent XSS attacks
            secure: false, // HTTPS only in production
            sameSite: "strict", // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
            path: "/", // Available on all routes
            //domain: process.env.COOKIE_DOMAIN, // Set if using cross-domain cookies
          });

          res.json({
            success: true,
            message: "Login successful",
            user: {
              email: response.email,
            },
          });

          res.json(response);
        } catch (error) {
          console.error("Login error:", error);
          res.status(500).json({
            success: false,
            message: "Login failed",
          });
        }
        
  })();
});

export default router;