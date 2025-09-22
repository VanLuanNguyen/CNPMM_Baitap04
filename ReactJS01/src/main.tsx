import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/home.tsx";
import UserPage from "./pages/user.tsx";
import RegisterPage from "./pages/register.tsx";
import LoginPage from "./pages/login.tsx";
import { FavoritesPage } from "./pages/favorites.tsx";
import { ViewedProductsPage } from "./pages/viewed-products.tsx";
import { AuthWrapper } from "./components/context/auth.context.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "user",
        element: <UserPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "viewed-products",
        element: <ViewedProductsPage />,
      },
    ],
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </StrictMode>
);
