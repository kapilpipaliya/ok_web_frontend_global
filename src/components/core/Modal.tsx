export const Modal = () => {
 const people = [
  {
   name: "Leonard Krasner",
   handle: "leonardkrasner",
   imageUrl:
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
   name: "Floyd Miles",
   handle: "floydmiles",
   imageUrl:
    "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
   name: "Emily Selman",
   handle: "emilyselman",
   imageUrl:
    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
   name: "Kristin Watson",
   handle: "kristinwatson",
   imageUrl:
    "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
 ];
 return <div class="relative z-10" aria-labelledby="modal-title" role="dialog"
             aria-modal="true">
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

  <div class="fixed inset-0 z-10 overflow-y-auto">
   <div class="flex min-h-full justify-center p-4 text-center sm:items-center sm:p-0 bg-slate-100/[0.6]">
    <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
     <div>
      <div class="mt-3 text-center sm:mt-5">
       <h3 class="text-lg font-medium leading-6 text-gray-900">Selected values</h3>
       <div class="mt-6 flow-root">
        <ul role="list" class="-my-5 divide-y divide-gray-200">
         {people.map((person) => (
          <li class="py-4">
           <div class="flex items-center space-x-4">
            <div class="min-w-0 flex-1">
             <p
              class="truncate text-sm font-medium text-gray-900">{person.name}</p>
            </div>
            <div>
             <button
              class="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
             >
              remove
             </button>
            </div>
           </div>
          </li>
         ))}
        </ul>
       </div>
      </div>
     </div>
     <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <button type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm">Close
      </button>
     </div>
    </div>
   </div>
  </div>
 </div>;
};