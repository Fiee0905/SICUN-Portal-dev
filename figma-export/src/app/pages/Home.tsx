import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryCards } from '../components/CategoryCards';
import { RecommendedCourses } from '../components/RecommendedCourses';
import { NewCourses } from '../components/NewCourses';
import { FeaturedTeachers } from '../components/FeaturedTeachers';
import { Announcements } from '../components/Announcements';
import { NewsSection } from '../components/NewsSection';

export function Home() {
  return (
    <>
      <HeroCarousel />
      <CategoryCards />
      <RecommendedCourses />
      <NewCourses />
      <FeaturedTeachers />
      <Announcements />
      <NewsSection />
    </>
  );
}
