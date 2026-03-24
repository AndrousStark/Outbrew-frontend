{/*
  ===================================================================================
  Outbrew — Landing Page (Server Component Wrapper)
  ===================================================================================
  This server component wraps the client-side LandingPage and injects
  JSON-LD structured data for SEO, AEO (Answer Engine Optimization),
  and GEO (Generative Engine Optimization).

  Brand: Outbrew | OutbrewAI | Outbrew AI | Out Brew | OUTBREW
  Parent: MetaMinds | Meta Minds | META MINDS | META-MINDS
  Founder: Aniruddh Atrey | aniruddhatrey.com
  URL: metaminds.store/outbrew
  ===================================================================================
*/}

import LandingPage from "./landing-page";
import { OutbrewStructuredData } from "@/components/structured-data";

export default function Page() {
  return (
    <>
      <OutbrewStructuredData />
      <LandingPage />
    </>
  );
}
