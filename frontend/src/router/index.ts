import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SpeciesGenome from '../views/species-genome.vue'
import SpeciesTable from '../views/species-table.vue'
//import ProteinData from '../views/protein-data.vue'
import GeneSearch from '../views/gene-search.vue'
//import ProteinSearch from '../views/protein-search.vue'
import pathway from '../views/pathway.vue'
import Blast from '../views/BlastView.vue'
import PrimerDesigner from '../views/PrimerDesigner.vue'
import MLprediction from '../views/MLprediction.vue'
import FlavonoidMap from '../views/flavonoid-map.vue'
// import CytoscapeExample from '../views/CytoscapeExample.vue'


const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/MLprediction',
      redirect: '/MLprediction/GT'
    },
    {
      path: '/MLprediction/:enzymeType(GT|AT|MT)',
      name: 'MLprediction',
      component: MLprediction
    },
    {
      path: '/species-genome',
      name: 'species-genome',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: SpeciesGenome,
    },
    {
      path: '/species-table',
      name: 'species-table',
      component: SpeciesTable,
    },
    /*{
      path: '/protein-data',
      name: 'protein-data',
      component: ProteinData,
    },*/
    {
      path: '/gene-search',
      name: 'gene-search',
      component: GeneSearch,
    },
    /*{
      path: '/protein-search',
      name: 'protein-search',
      component: ProteinSearch
    },*/
    {
      path: '/pathway',
      name: 'pathway',
      component: pathway
    },
    {
      path: '/flavonoid-map',
      name: 'flavonoid-map',
      component: FlavonoidMap
    },
    {
      path: '/BlastView',
      name: 'BlastView',
      component: Blast
    },
    {
      path: '/PrimerDesigner',
      name: 'PrimerDesigner',
      component: PrimerDesigner
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    // {
    //   path: '/cytoscape-example',
    //   name: 'cytoscape-example',
    //   component: CytoscapeExample
    // }
  ],
})

console.log('[router] index.ts loaded');

export default router
