import numpy as np

goals=['200 Lbs',
       'Crochet Finish project',
       'Vienna',
       'Italie',
       'Painting Korea',
       'Painting Phare',
       'Painting Condo',
       'Fire detection prototype',
       'First novel brouillon',
       'Green pill online',
       'ExoPlanet Alpha',
       '52 books',
       '200 km Run',
       'Class satellite listen',
       'Table Cafe',
       'Meuble Tele',
       'Recyclage meuble',
       '1 New Recipe per month',
       'Class Optic done',
       'Clean Emails completely',
       '1 Full paper draft on use of synth plumes',
       '1 Full paper draft on Fire detection'
       'bac plant',
       '3 veggies or stuff grown during summer']

goals=np.array(goals)
np.random.shuffle(goals)
print(goals)
