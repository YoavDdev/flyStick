import {
  Hero,
  Hero2,
  Feature,
  Pricing,
  VideoCarusel,
  Quiz,
  ProductSell,
  User,
} from "./components";

export default function HomePage() {
  return (
    <main className="bg-[#FCF6F5]">
      {/* <Hero /> */}
      <Hero2 />
      <Feature />
      <VideoCarusel />
      {/* <Quiz /> */}
      {/* <ProductSell /> */}
      <Pricing />
      {/* <User /> */}
    </main>
  );
}
