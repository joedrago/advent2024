#include <algorithm>
#include <fstream>
#include <map>
#include <sstream>
#include <string>
#include <vector>

int main(int argc, char * argv[])
{
    if (argc < 2) {
        printf("Syntax: main [input.txt]\n");
        return 1;
    }
    const std::string inputFilename = argv[1];

    std::vector<int> listL;
    std::vector<int> listR;
    std::map<int, int> countR;

    std::ifstream f;
    f.open(inputFilename);
    std::stringstream ss;
    ss << f.rdbuf();
    const std::string contents = ss.str();

    std::size_t lineStart = 0;
    for (;;) {
        const std::size_t lineEnd = contents.find("\n", lineStart);
        if (lineEnd == std::string::npos) {
            break;
        }

        const std::string line = contents.substr(lineStart, lineEnd - lineStart);
        if (line.size() > 0) {
            int l = 0;
            int r = 0;
            std::istringstream(line) >> l >> r;
            listL.push_back(l);
            listR.push_back(r);

            std::map<int, int>::iterator e = countR.find(r);
            if (e == countR.end()) {
                countR.insert(std::pair<int, int>(r, 1));
            } else {
                ++e->second;
            }
        }

        lineStart = lineEnd + 1;
    }

    std::sort(listL.begin(), listL.end());
    std::sort(listR.begin(), listR.end());

    int totalDistance = 0;
    int similarityScore = 0;
    for (int i = 0; i < listL.size(); ++i) {
        int l = listL[i];
        int r = listR[i];
        int diff = l - r;
        if (diff < 1) {
            diff *= -1;
        }
        totalDistance += diff;

        std::map<int, int>::iterator e = countR.find(l);
        if (e != countR.end()) {
            similarityScore += l * e->second;
        }
    }

    printf("Total Distance  : %d\n", totalDistance);
    printf("Similarity Score: %d\n", similarityScore);
    return 0;
}
