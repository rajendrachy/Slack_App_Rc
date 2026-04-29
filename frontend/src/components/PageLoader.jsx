import { Loader } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <Loader className="text-primary animate-spin size-10" />
    </div>
  );
};
export default PageLoader;
