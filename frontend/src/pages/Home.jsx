// import { AppLayout } from "../components/layout/Layout";

// export default function Home() {
//   return (
//     <AppLayout title="Home">
//       <div></div>
//     </AppLayout>
//   );
// }

import { Outlet } from "react-router-dom";
import { AppLayout } from "../components/layout/Layout";

export default function Home() {
  return (
    <AppLayout title="Home">
      {/* Whatever route is under "/" (dashboard, promotions, etc.)
          will render here on the right side */}
      <Outlet />
    </AppLayout>
  );
}
