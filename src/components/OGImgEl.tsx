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
    <div tw="flex relative flex-col w-full h-full bg-gray-950 text-white items-center justify-center px-16">
      {/* Main Content */}
      <div tw="flex flex-col items-center text-center max-w-4xl">
        {/* Badge */}
        <div tw="flex items-center justify-center bg-blue-900 rounded-full px-6 py-3 mb-8">
          <div tw="w-5 h-5 bg-blue-400 rounded-full mr-3"></div>
          <div tw="text-blue-300 font-semibold text-lg">Own the Answer</div>
        </div>

        {/* Main Heading */}
        <div tw="text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-gray-100 to-gray-400 bg-clip-text text-transparent">
          Rank Higher in AI Search
        </div>

        {/* Subheading */}
        <div tw="text-2xl text-gray-400 mb-8 max-w-3xl leading-relaxed">
          Optimize your content to be the top-cited source in ChatGPT, Claude,
          Perplexity, and Gemini. Stop losing traffic to AI-generated answers
        </div>

        {/* Input Section */}
        <div tw="flex items-center bg-gray-900 rounded-xl border border-gray-800 p-4 w-full max-w-3xl">
          <div tw="text-gray-400 text-xl flex-1">
            Enter your website (e.g., example.com)
          </div>
          <div tw="bg-blue-600 rounded-lg p-3 ml-4">
            <div tw="text-white text-2xl">✨</div>
          </div>
        </div>

        {/* Bottom Branding */}
        <div tw="mt-12 text-gray-500 text-xl">
          FlowQL - Rank Higher in LLM Search Results
        </div>
      </div>
    </div>
  );
};
