import { Request, Response, Router } from "express";
import { productClient } from "../client/productClient";
import { authenticate } from "../middlewares/authenticate";

declare module "express" {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

const router = Router()

router.get('/categories', (req: Request, res: Response) => {
    (async () => {
        try {
            const categories = await productClient.getAllCategories({});

            res.json(categories)
        } catch (error) {
            console.error("Category fetching error:", error);
            res.status(500).json({
              success: false,
              message: "Category fetching failed",
            });
        }
    })()
})

router.get("/categories/save-user-preferences", authenticate, (req: Request, res: Response) => {
  (async () => {
    try {
      const { categoryIds } = req.body;
        const userId = req!.user!.userId;
        
        if (!categoryIds || !Array.isArray(categoryIds)) {
          return res.status(400).json({
            success: false,
            message: "Category IDs must be provided as an array",
          });
        }

      const response = await productClient.SaveUserCategoryPreferences({
        userId,
        categoryIds,
      });

      res.json({
        success: true,
        message: "User preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save preferences",
      });
    }
  })();
});

router.get(
  "/products/get-products-from-user-category-preferences",
  authenticate,
  (req: Request, res: Response) => {
    (async () => {
      try {
        const userId = req!.user!.userId;
        
        const response = await productClient.GetAllProductsFromCategoriesUserPrefers({
          userId
        });


        res.json({
          success: true,
          message: "Products fetched successfully",
          products: response.productItems
        });
      } catch (error) {
        console.error("Error saving preferences:", error);
        res.status(500).json({
          success: false,
          message: "Failed to save preferences",
        });
      }
    })();
  }
);


export default router;