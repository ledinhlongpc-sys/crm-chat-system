export default function EmptyTable({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <tbody>
      <tr>
        <td
          colSpan={100}
          className="py-12 text-center text-neutral-500"
        >
          <div className="font-medium text-neutral-700">
            {title}
          </div>

          {description && (
            <div className="text-sm mt-1">
              {description}
            </div>
          )}
        </td>
      </tr>
    </tbody>
  );
}
