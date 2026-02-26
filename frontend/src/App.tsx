import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import ModListingPage from './pages/ModListingPage';
import ModUploadPage from './pages/ModUploadPage';
import ModDetailPage from './pages/ModDetailPage';
import MyModsPage from './pages/MyModsPage';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster theme="dark" position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ModListingPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: ModUploadPage,
});

const modDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mod/$id',
  component: ModDetailPage,
});

const myModsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-mods',
  component: MyModsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, uploadRoute, modDetailRoute, myModsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
