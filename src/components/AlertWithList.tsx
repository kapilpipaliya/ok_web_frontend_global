interface WithListProps {
    errors: string[];
    title: string;
  }
  
  export function AlertWithList(props: Readonly<WithListProps>) {
    return (
      <div class="bg:rgb(254,242,242) border-radius:0.375rem p:1rem">
        <div class="flex">
          <div class="flex-shrink:0">
            <svg aria-hidden="true" class="color:rgb(248,113,113) h:1.25rem w:1.25rem" fill="currentColor" viewBox="0 0 20 20">
              <path 
                clip-rule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                fill-rule="evenodd" 
              />
            </svg>
          </div>
          <div class="ml:0.75rem">
            <h3 class="lh:1.25rem color:rgb(153,27,27) f:0.875rem font-weight:500">{props.title}</h3>
            <div class="lh:1.25rem color:rgb(185,28,28) f:0.875rem mt:0.5rem">
              <ul class="space-y:0.25rem list-style-type:disc pl:1.25rem" role="list">
                {props.errors.map(error => (
                  <li>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  