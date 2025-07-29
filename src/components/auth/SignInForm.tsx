import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState(""); // No default value
  const [password, setPassword] = useState(""); // No default value

  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "Admin@123") {
      navigate("/profile"); // ✅ Redirect on correct credentials
    } else {
      alert("Invalid credentials"); // ❌ Wrong username or password
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pt-10">
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <Label>
              Username <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          {/* <div className="flex items-center gap-3">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
              Keep me logged in
            </span>
          </div> */}

          <div>
            <Button type="submit" className="w-full" size="sm">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
