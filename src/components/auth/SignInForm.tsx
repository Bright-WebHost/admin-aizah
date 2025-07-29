import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";

// Temporary Input component with proper typing
const Input = ({
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  required = false,
  className = "",
  ...props
}: {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};

// Temporary Button component
const Button = ({
  children,
  type = "button",
  className = "",
  size = "md",
  ...props
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-2.5 px-5 text-base",
    lg: "py-3 px-6 text-lg",
  };

  return (
    <button
      type={type}
      className={`w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignIn = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username === "admin" && password === "Admin@123") {
      navigate("/profile");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: ChangeEvent<HTMLInputElement>) => setter(e.target.value);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pt-10">
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <Label>
              Username <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={handleInputChange(setUsername)}
              required
                   className="dark:text-white text-black"
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
                onChange={handleInputChange(setPassword)}
                required
                className="dark:text-white text-black"
                
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" size="sm">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}