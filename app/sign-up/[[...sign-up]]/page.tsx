import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Join PixelMatch</h1>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Start your adventure in a safe, verified dating community
        </p>
        <SignUp />
      </div>
    </div>
  );
}
