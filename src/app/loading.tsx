export default function GlobalLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div
        className="border-tinta-200 border-t-dourado-500 h-12 w-12 animate-spin rounded-full border-4"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}
