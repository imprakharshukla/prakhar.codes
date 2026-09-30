import { Avatar, AvatarImage, AvatarFallback } from "@prakhar/ui";

export default function ProfileAvatar() {
  return (
    <Avatar className="h-12 w-12">
      <AvatarImage
        src="/images/pfp.jpg"
        alt="Prakhar Shukla"
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarFallback>PS</AvatarFallback>
    </Avatar>
  );
}
