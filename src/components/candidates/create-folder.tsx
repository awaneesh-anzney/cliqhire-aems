import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder,Plus} from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { FolderLogo } from "@/components/folder-logo"
export function CreateFolder() {
      return (
        <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto p-4">
          
          <div className="w-48 h-48 mb-6">
           <FolderLogo/>
          </div>
          <h3 className="mb-3 text-xl font-semibold">You have not created any folders yet</h3>
          <p className="mb-6  text-muted-foreground">
            Creating folders will allow you to organize candidates in your database by adding them to folders, and share those
            folders with your team.
          </p>
          <Button className="bg-black ">
            Create folder
          </Button>
          <Button variant="link" className="mt-2 text-[#4477CE]">
            Learn more about folders
          </Button>
        </div>
        </div>
      )
    //   <div className="flex-1 flex items-center justify-center">
    //   {showCreateFolder ? (
    //     <CreateFolder onClose={() => setShowCreateFolder(false)} />
    //   ) : (
    //     <CandidatesEmptyState>
    //       <div className="flex flex-col items-center gap-4">
    //         <CreateCandidateButton />
    //         <Link href="#" className="text-blue-600 hover:underline">
    //           Learn more about candidates
    //         </Link>
    //       </div>
    //     </CandidatesEmptyState>
    //   )}
    // </div>
}