/**
 * Local fallback word lists organized by category and approximate length.
 * Used when the external word API is unavailable.
 */
const wordLists = {
  animals: {
    short: ['bear', 'deer', 'frog', 'goat', 'hawk', 'lion', 'mole', 'newt', 'seal', 'toad', 'wolf', 'crab', 'duck', 'fish', 'lamb'],
    medium: ['badger', 'beaver', 'camel', 'donkey', 'falcon', 'ferret', 'gerbil', 'iguana', 'jaguar', 'lizard', 'monkey', 'parrot', 'pigeon', 'rabbit', 'salmon', 'turtle', 'walrus'],
    long: ['alligator', 'armadillo', 'butterfly', 'chameleon', 'chimpanzee', 'crocodile', 'dalmatian', 'dragonfly', 'elephant', 'flamingo', 'goldfinch', 'greyhound', 'jellyfish', 'kangaroo', 'nighthawk', 'orangutan', 'porcupine', 'reindeer', 'scorpion', 'swordfish'],
  },
  fruits: {
    short: ['date', 'fig', 'kiwi', 'lime', 'pear', 'plum', 'grape', 'apple', 'guava', 'lemon', 'mango', 'melon', 'olive', 'peach'],
    medium: ['banana', 'cherry', 'lychee', 'orange', 'papaya', 'quince', 'raisin', 'tomato', 'apricot', 'avocado', 'coconut', 'currant', 'kumquat'],
    long: ['blueberry', 'cranberry', 'dragonfruit', 'elderberry', 'gooseberry', 'grapefruit', 'jackfruit', 'mandarin', 'nectarine', 'persimmon', 'pineapple', 'pomegranate', 'raspberry', 'starfruit', 'strawberry', 'tangerine', 'watermelon'],
  },
  food: {
    short: ['beef', 'cake', 'corn', 'dill', 'eggs', 'fish', 'herb', 'jamb', 'milk', 'nuts', 'pork', 'rice', 'salt', 'soup', 'taco', 'tofu', 'wrap'],
    medium: ['brisket', 'burger', 'butter', 'carrot', 'cheese', 'cookie', 'dumpling', 'ginger', 'garlic', 'muffin', 'noodle', 'pastry', 'pepper', 'potato', 'pretzel', 'radish', 'waffle'],
    long: ['artichoke', 'asparagus', 'bruschetta', 'casserole', 'croissant', 'guacamole', 'hamburger', 'pepperoni', 'quesadilla', 'spaghetti', 'stroganoff', 'tortellini', 'enchilada', 'chocolate', 'cinnamon', 'mushroom', 'pepperoni'],
  },
};

module.exports = wordLists;
