import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { PageConfig } from "./pages/PageConfig";
import { ContentManagement } from "./pages/ContentManagement";
import { UserManagement } from "./pages/UserManagement";
import { LogManagement } from "./pages/LogManagement";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "pages",
        element: <PageConfig />,
      },
      {
        path: "content",
        element: <ContentManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "logs",
        element: <LogManagement />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
