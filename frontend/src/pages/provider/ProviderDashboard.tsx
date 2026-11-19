import { useAppSelector } from '../../app/hooks';
import { Link } from 'react-router-dom';
 import {
   ArrowRight,
   MessageCircle,
  ImagePlus,
   PackagePlus,
   Pencil,
   Store,
   Users,
 } from 'lucide-react';
 import { useGetMyServicesQuery, serviceImage } from '../../features/services/servicesApi';
 import { useGetConversationsQuery } from '../../features/messages/messagesApi';
 import { useGetProviderReviewsQuery } from '../../features/profile/providersApi';
 
 export default function ProviderDashboard() {
   const user = useAppSelector((state) => state.auth.user);
   const {
     data: services = [],
     isLoading: isLoadingServices,
     isError: servicesError,
     refetch: refetchServices,
   } = useGetMyServicesQuery();
   const {
     data: conversations = [],
     isLoading: isLoadingConversations,
     isError: conversationsError,
     refetch: refetchConversations,
   } = useGetConversationsQuery(undefined, { pollingInterval: 10000 });
   const { data: reviewSummary, isLoading: isLoadingReviews } = useGetProviderReviewsQuery(user?.id ?? 0, {
     skip: !user?.id,
   });
 
   const stats = [
     { title: 'Total Services', value: services.length, icon: Store },
     { title: 'Active Services', value: services.filter((service) => service.active).length, icon: Store },
     { title: 'Conversations', value: conversations.length, icon: MessageCircle },
    { title: 'Provider Rating', value: isLoadingReviews ? 'Loading...' : reviewSummary?.reviewCount ? `${reviewSummary.averageRating.toFixed(1)} ★ · ${reviewSummary.reviewCount} reviews` : 'No reviews', icon: Users },
   ];
 
   return (
     <div className="mx-auto max-w-7xl space-y-8">
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div>
           <h2 className="text-2xl font-semibold text-[#351018]">Dashboard</h2>
           <p className="mt-1 text-sm text-[#351018]/60">
             Manage your services and connect with clients.
           </p>
         </div>
         <Link
           to="/provider/services/new"
           className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]"
         >
           <PackagePlus size={18} /> Add New Service
         </Link>
       </div>
 
       <section className="flex items-center gap-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
         {user?.avatar ? (
           <img
             src={serviceImage(user.avatar) || undefined}
             alt={user.businessName || user.name}
             className="h-16 w-16 rounded-full object-cover"
           />
         ) : (
           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2D9DC] text-xl font-semibold text-[#351018]">
             {(user?.businessName || user?.name || 'P').charAt(0).toUpperCase()}
           </div>
         )}
         <div className="min-w-0">
           <p className="text-sm text-[#351018]/60">Provider account</p>
           <h3 className="truncate text-lg font-semibold text-[#351018]">
             {user?.businessName || user?.name}
           </h3>
         </div>
       </section>
 
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
         {stats.map(({ title, value, icon: Icon }) => (
           <div key={title} className="ye-stat rounded-2xl border border-[#D9A3AA]/40 bg-white p-6">
             <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2D9DC]">
               <Icon size={21} className="text-[#351018]" />
             </div>
             <p className="text-sm text-[#351018]/60">{title}</p>
             <p className="mt-2 text-2xl font-semibold text-[#351018]">{value}</p>
           </div>
         ))}
       </div>
 
       <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-6">
         <div className="mb-5 flex items-center justify-between gap-3">
           <h3 className="text-lg font-semibold text-[#351018]">My Services</h3>
           <Link to="/provider/services" className="inline-flex items-center gap-2 text-sm font-medium text-[#351018] hover:text-[#A86F79]">
             View All <ArrowRight size={16} />
           </Link>
         </div>
         {isLoadingServices ? (
           <p className="text-sm text-[#351018]/60">Loading services...</p>
         ) : servicesError ? (
           <p className="text-sm text-red-600">
             Failed to load services. <button onClick={() => refetchServices()} className="underline">Try again</button>
           </p>
         ) : services.length === 0 ? (
           <div className="py-7 text-center">
             <p className="text-sm text-[#351018]/60">You have not added any services yet.</p>
             <Link to="/provider/services/new" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#351018]">
               <PackagePlus size={16} /> Add your first service
             </Link>
           </div>
         ) : (
           <div className="divide-y divide-[#D9A3AA]/30">
             {services.slice(0, 3).map((service) => (
               <div key={service.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                 {serviceImage(service.images?.[0]) ? (
                   <img src={serviceImage(service.images[0]) || undefined} alt={service.title} className="h-16 w-20 rounded-lg object-cover" />
                 ) : (
                   <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-[#F2D9DC]/50 text-xs text-[#351018]/50">No image</div>
                 )}
                 <Link to={`/provider/services/${service.id}`} className="min-w-0 flex-1">
                   <span className="block truncate font-medium text-[#351018]">{service.title}</span>
                   <span className="mt-1 block text-sm text-[#351018]/60">{service.category} · {service.city}</span>
                   <span className="mt-1 block text-sm font-semibold text-[#351018]">{Number(service.price).toLocaleString()} AMD</span>
                 </Link>
                 <Link to={`/provider/services/${service.id}/edit`} aria-label={`Edit ${service.title}`} className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] hover:bg-[#F2D9DC]/50">
                   <Pencil size={16} />
                 </Link>
               </div>
             ))}
           </div>
         )}
       </section>
 
       <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-6">
         <div className="mb-5 flex items-center justify-between gap-3">
           <h3 className="text-lg font-semibold text-[#351018]">Recent Messages</h3>
           <Link to="/provider/messages" className="inline-flex items-center gap-2 text-sm font-medium text-[#351018] hover:text-[#A86F79]">
             View All <ArrowRight size={16} />
           </Link>
         </div>
         {isLoadingConversations ? (
           <p className="text-sm text-[#351018]/60">Loading conversations...</p>
         ) : conversationsError ? (
           <p className="text-sm text-red-600">
             Failed to load conversations. <button onClick={() => refetchConversations()} className="underline">Try again</button>
           </p>
         ) : conversations.length === 0 ? (
           <div className="py-7 text-center">
             <Users size={30} className="mx-auto mb-2 text-[#D9A3AA]" />
             <p className="text-sm text-[#351018]/60">No conversations with organizers yet.</p>
           </div>
         ) : (
           <div className="divide-y divide-[#D9A3AA]/30">
             {conversations.slice(0, 4).map((conversation) => (
               <Link key={conversation.id} to={`/provider/messages?chat=${conversation.id}`} className="block py-4 first:pt-0 last:pb-0">
                 <div className="flex items-center justify-between gap-3">
                   <span className="font-medium text-[#351018]">{conversation.organizer?.name || 'Organizer'}</span>
                   <span className="text-xs text-[#351018]/50">{new Date(conversation.updatedAt).toLocaleDateString()}</span>
                 </div>
                 <p className="mt-1 truncate text-sm text-[#351018]/60">
                   {conversation.messages?.[0]?.body || 'No messages yet. Open conversation.'}
                 </p>
               </Link>
             ))}
           </div>
         )}
       </section>
 
       <section className="space-y-3">
         <h3 className="text-lg font-semibold text-[#351018]">Quick Actions</h3>
         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
           {[
             { label: 'Add New Service', to: '/provider/services/new', icon: PackagePlus },
             { label: 'My Services', to: '/provider/services', icon: Store },
             { label: 'Edit Profile', to: '/provider/profile', icon: Pencil },
             { label: 'My Works', to: '/provider/portfolio', icon: ImagePlus },
             { label: 'Messages', to: '/provider/messages', icon: MessageCircle },
           ].map(({ label, to, icon: Icon }) => (
             <Link key={to} to={to} className="inline-flex items-center gap-3 rounded-xl border border-[#D9A3AA]/40 bg-white p-4 text-sm font-medium text-[#351018] transition hover:bg-[#F2D9DC]/40">
               <Icon size={18} /> {label}
             </Link>
           ))}
         </div>
       </section>
     </div>
   );
}