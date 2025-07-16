/* eslint-disable @next/next/no-img-element */

export const RenderIMGEl = ({
  logo,
  image,
  locale,
}: {
  logo: string;
  locale: string;
  image: string;
}) => {
  return (
    <div tw="flex relative flex-col p-12 w-full h-full rounded bg-white text-black items-center">
      <div tw="flex flex-col items-center my-8">
        <div tw="text-6xl font-bold tracking-tight text-black mb-4">FlowQL</div>
        <div tw="text-2xl text-gray-600 mb-6">
          Understand what AI is saying about your brand
        </div>
        <div tw="text-xl text-gray-500">
          Optimize your content to be the top-cited source in ChatGPT,
          Perplexity, and Google SGE
        </div>
      </div>
      <div tw="flex items-center justify-center bg-blue-50 rounded-lg p-6 w-full max-w-4xl">
        <div tw="text-lg text-blue-800 font-semibold">www.flowql.com</div>
      </div>
    </div>
  );
};
