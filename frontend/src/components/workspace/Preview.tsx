interface Props {
  footerRef: any;
  url: string;
}
export default function Preview(props: Props) {
  return (
    <div className="h-full flex-1  bg-background ">
      {props.url ? (
        <iframe
          title="Website Preview"
          className="w-full h-full border border-border"
          src={props.url}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
          Preview is loading...
        </div>
      )}
    </div>
  );
}
