import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center space-y-4">
      <h1 className="text-6xl font-bold text-muted-dim">404</h1>
      <p className="text-muted text-sm">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-6 text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
