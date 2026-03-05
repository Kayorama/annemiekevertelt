import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join RenderOwl and start creating</p>
        </div>
        <div data-testid="sign-up-form">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
