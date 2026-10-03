import { useApp } from "./lib/store.jsx";
import Header from "./components/Header.jsx";
import SearchSheet from "./components/SearchSheet.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import ModalRoot from "./components/ModalRoot.jsx";
import OrderTracker from "./components/OrderTracker.jsx";
import PreviewBar from "./components/PreviewBar.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import MobileNav from "./components/MobileNav.jsx";
import InstallBar from "./components/InstallBar.jsx";
import Toasts from "./components/Toasts.jsx";
import Footer from "./components/Footer.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GuestPage from "./pages/GuestPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  const { ui } = useApp();
  return (
    <>
      <Header />
      <SearchSheet />
      <main id="top">
        {ui.view === "auth" && <LoginPage />}
        {ui.view === "guest" && <GuestPage />}
        {ui.view === "admin" && <AdminPage />}
      </main>
      {ui.view === "guest" && <Footer />}
      <CartDrawer />
      <ModalRoot />
      <OrderTracker />
      <PreviewBar />
      <ChatWidget />
      <MobileNav />
      <InstallBar />
      <Toasts />
    </>
  );
}
