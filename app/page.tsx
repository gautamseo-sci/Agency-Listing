import { AccordionComponent } from "@/components/homepage/accordion-component";
import BlogSample from "@/components/homepage/blog-samples";
import HeroSection from "@/components/homepage/hero-section";
import BrowseAgencyGalleries from "@/components/homepage/Browse-agency";
import Pricing from "@/components/homepage/pricing";
import SideBySide from "@/components/homepage/side-by-side";
import HowItWorks from "@/components/homepage/how-it-works";
import PageWrapper from "@/components/wrapper/page-wrapper";
import config from "@/config";

export default function Home() {
  return (
    <PageWrapper>
      <div data-scroll-section className="flex flex-col justify-center items-center w-full mt-[1rem] p-3">
        <HeroSection />
      </div>
      <div data-scroll-section className="flex my-[8rem] w-full justify-center items-center">
        <SideBySide />
      </div>
      <div data-scroll-section>
        <HowItWorks />
      </div>
      <div data-scroll-section className="flex flex-col p-2 w-full justify-center items-center">
        <BrowseAgencyGalleries />
      </div>
      <div data-scroll-section className="flex justify-center items-center w-full my-[8rem]">
        <AccordionComponent />
      </div>

      {/* <div className="max-w-[1200px] p-8 mt-[2rem] lg:mt-[6rem] lg:mb-[5rem]">
        <BlogSample />
      </div>
      {(config.auth.enabled && config.payments.enabled) && <div>
        <Pricing />
      </div>} */}
    </PageWrapper>
  );
}

