#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// --------------------------------------------------------------------------------------

struct intArray
{
    size_t capacity;
    size_t len;
    int * values;
};

void intArrayPush(struct intArray * ia, int v)
{
    if (ia->len >= ia->capacity) {
        if (ia->capacity) {
            ia->capacity *= 2;
        } else {
            ia->capacity = 8;
        }
        int * oldValues = ia->values;
        ia->values = (int *)malloc(sizeof(int) * ia->capacity);
        memcpy(ia->values, oldValues, sizeof(int) * ia->len);
        free(oldValues);
    }

    ia->values[ia->len] = v;
    ++ia->len;
}

void intArrayInit(struct intArray * ia)
{
    memset(ia, 0, sizeof(struct intArray));
}

void intArrayClear(struct intArray * ia)
{
    free(ia->values);
    memset(ia, 0, sizeof(struct intArray));
}

void intArraySort(struct intArray * ia)
{
    int n = ia->len;
    int i, j;
    int swapped;
    for (i = 0; i < n - 1; i++) {
        swapped = 0;
        for (j = 0; j < n - i - 1; j++) {
            if (ia->values[j] > ia->values[j + 1]) {
                int t = ia->values[j];
                ia->values[j] = ia->values[j + 1];
                ia->values[j + 1] = t;
                swapped = 1;
            }
        }

        if (!swapped) {
            break;
        }
    }
}

// --------------------------------------------------------------------------------------

struct intMap
{
    struct intMap * next;
    int key;
    int val;
};

struct intMap * intMapInc(struct intMap * im, int key)
{
    struct intMap * p = im;
    while (p != NULL) {
        if (p->key == key) {
            ++p->val;
            return im;
        }

        p = p->next;
    }

    // We didn't find it
    struct intMap * n = malloc(sizeof(struct intMap));
    n->key = key;
    n->val = 1;
    n->next = im;
    return n;
}

int intMapVal(struct intMap * im, int key, int def)
{
    struct intMap * p = im;
    while (p != NULL) {
        if (p->key == key) {
            return p->val;
        }

        p = p->next;
    }

    return def;
}

struct intMap * intMapClear(struct intMap * im)
{
    struct intMap * p = im;
    while (p != NULL) {
        struct intMap * d = p;
        p = p->next;
        free(d);
    }
    return NULL;
}

// --------------------------------------------------------------------------------------

int main(int argc, char * argv[])
{
    if (argc < 2) {
        printf("Syntax: main [input.txt]\n");
        return 1;
    }
    const char * inputFilename = argv[1];

    struct intArray listL;
    intArrayInit(&listL);
    struct intArray listR;
    intArrayInit(&listR);

    struct intMap * countR = NULL;

    FILE * f = fopen(inputFilename, "rb");
    fseek(f, 0, SEEK_END);
    size_t fileSize = ftell(f);
    fseek(f, 0, SEEK_SET);
    char * contents = malloc(fileSize + 1);
    fread(contents, 1, fileSize, f);
    contents[fileSize] = 0;

    char * line = contents;
    while (line != NULL) {
        char * nextLine = strstr(line, "\n");
        if (nextLine != NULL) {
            *nextLine = 0;
            ++nextLine;
        }
        if (strlen(line) < 1) {
            line = nextLine;
            continue;
        }

        while (*line == ' ') {
            ++line;
        }
        int l = atoi(line);

        while (*line != ' ' && *line) {
            ++line;
        }
        while (*line == ' ') {
            ++line;
        }
        int r = atoi(line);

        intArrayPush(&listL, l);
        intArrayPush(&listR, r);

        countR = intMapInc(countR, r);

        line = nextLine;
    }

    intArraySort(&listL);
    intArraySort(&listR);

    int totalDistance = 0;
    int similarityScore = 0;
    for (int i = 0; i < listL.len; ++i) {
        int l = listL.values[i];
        int r = listR.values[i];
        int diff = l - r;
        if (diff < 1) {
            diff *= -1;
        }
        totalDistance += diff;

        similarityScore += l * intMapVal(countR, l, 0);
    }

    printf("Total Distance  : %d\n", totalDistance);
    printf("Similarity Score: %d\n", similarityScore);

    free(contents);
    intArrayClear(&listL);
    intArrayClear(&listR);
    countR = intMapClear(countR);
    return 0;
}
