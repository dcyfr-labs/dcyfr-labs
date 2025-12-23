// Project feature components
export { ProjectFilters } from "./project-filters";
export { ProjectCard } from "./project-card";
export { ProjectCardSkeleton } from "./project-card-skeleton";
export { ProjectList } from "./project-list";
export { OtherProjectCard } from "./other-project-card";

// Search components
export { ProjectSearchClient, useProjectSearch } from "./project-search-client";

// Photo gallery components
export { PhotoCard } from "./photo-card";
export type { Photo } from "./photo-card";
export { PhotoGrid } from "./photo-grid";

// Layout strategy components
export { 
  ProjectLayoutStrategy,
  DefaultProjectLayout,
  CodeProjectLayout,
  GalleryProjectLayout,
} from "./layouts";
