function loadExample() {
    const dropdown = document.getElementById('exampleDropdown');
    const selectedFile = dropdown.value;

    if (selectedFile === 'example1') {
        text = 'A farmer bought a well from his neighbour to water his farm. The neighbour sold him the well but did not allow him to draw water from it. The farmer went to the emperor for justice. His courtier questioned the neighbour, who said that he had sold the well but not the water within it. The neighbour was told to either pay rent for the water to remove it all immediately. Realising that his trick didn’t work, he apologised and went home.';
        document.getElementById('contextInput').value = text; 
    } else if (selectedFile === 'example2') {
        text = 'Two friends were walking through the forest. Since it was dangerous, they promised to stay close to each other. They see a bear approaching them. One friend scurries up a tree, leaving the other one behind. The other friend decided to pretend to be dead. The bear approached him, smelled his ear and then left. The friend in the tree climbed down and asked the other friend what the bear had told him. He replies, “The bear simply advised against believing a false friend.”'
        document.getElementById('contextInput').value = text;
    } else if (selectedFile === 'example3') {
        text = 'The Greek king Midas did a good deed for a Satyr. This prompted Dionysus, the god of wine, to grant him a wish. Midas asked for everything he touched to turn to gold. Dionysus’ warned him not to do so, but Midas could not be swayed. Midas excitedly started touching everything and turning them into gold. Soon, he became hungry. But he couldn’t eat anything because even his food turned to gold. His beloved daughter saw him in distress and ran to hug him. However, she, too, turned to gold. He realised then the golden touch was not a blessing.'
        document.getElementById('contextInput').value = text;
    }
}
