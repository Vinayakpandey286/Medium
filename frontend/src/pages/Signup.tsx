import { Auth } from "../components/Auth";
import { Quote } from "../components/Quote";

const signup = () => {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div>
          <Auth />
        </div>
        <div className="hidden lg:block">
          <Quote />
        </div>
      </div>
    </div>
  );
};

export default signup;
