import { Play } from "lucide-react";

const ProductTourSection = () => {
  return (
    <section className="section-padding section-alt">
      <div className="container mx-auto px-4 text-center">
        <h2 className="section-heading">
          <span className="gold-underline">See the Platform in Action</span>
        </h2>
        <p className="description-text max-w-2xl mx-auto mb-10 text-[18px]">
          Watch a walkthrough of how engineering firms use the platform to manage their entire practice.
        </p>

        {/* Video Embed Placeholder */}
        <div className="max-w-4xl mx-auto aspect-video bg-navy/5 border-2 border-dashed border-card-border rounded-xl flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gold ml-1" />
          </div>
          <p className="text-body-text font-semibold text-[18px] font-body">Product Tour Video</p>
          <p className="caption-text max-w-md">
            Embed your screen recording here to show prospective customers a live walkthrough of the platform.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductTourSection;
