   import { Spinner } from "@/ui/Spinner"

   export function PageLoader() {
       return (
           <div style={{ display: "flex", justifyContent: "center", padding: "96px 0" }}>
               <Spinner />
           </div>
       )
   }