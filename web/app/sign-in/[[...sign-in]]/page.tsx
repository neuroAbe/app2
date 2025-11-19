import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to PixelMatch</h1>
        <SignIn />
      </div>
    </div>
  );
}
