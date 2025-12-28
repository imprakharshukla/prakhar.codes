import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export default function ProfileAvatar() {
  return (
    <Avatar className="h-12 w-12">
      <AvatarImage
        src="https://resume-cdn.prakhar.codes/pfp/SCR-20251228-mipb.jpeg"
        alt="Prakhar Shukla"
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarFallback>PS</AvatarFallback>
    </Avatar>
  );
}
