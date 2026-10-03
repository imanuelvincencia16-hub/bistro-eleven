import { useApp } from "../lib/store.jsx";
import useReveal from "../hooks/useReveal.js";
import Hero from "../components/Hero.jsx";
import Pillars from "../components/Pillars.jsx";
import MenuSection from "../components/MenuSection.jsx";
import Story from "../components/Story.jsx";
import GalleryScatter from "../components/GalleryScatter.jsx";
import ReviewSection from "../components/ReviewSection.jsx";
import VisitSection from "../components/VisitSection.jsx";

export default function GuestPage() {
  const { data } = useApp();
  useReveal([data.menu.length, data.reviews.length]);

  return (
    <>
      <Hero />
      <Pillars />
      <MenuSection />
      <Story />
      <GalleryScatter />
      <ReviewSection />
      <VisitSection />
    </>
  );
}
