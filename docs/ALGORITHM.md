# Search method

A candidate assigns each lesson to a period and room. The cost function counts
teacher, section, and room collisions as hard violations, then adds a smaller
soft penalty for idle gaps, long days, and repeated course meetings. Tournament
selection, crossover, mutation, and elitism evolve a population. A fixed seed makes
a run repeatable; the search still does not prove optimality.
