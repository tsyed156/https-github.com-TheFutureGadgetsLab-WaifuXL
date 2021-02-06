import torchvision.datasets as datasets
import torchvision.transforms as transforms
from torch.utils.data import DataLoader

def getSTL10(batchSize):
    dataset = datasets.STL10

    transform = transforms.Compose([transforms.ToTensor()])

    train_data = dataset(root="data", split='train+unlabeled',  download=True, transform=transform)
    test_data  = dataset(root="data", split='test',             download=True, transform=transform)

    train_loader = DataLoader(train_data, batch_size=batchSize, shuffle=True, pin_memory=True, num_workers=4)
    test_loader  = DataLoader(test_data,  batch_size=batchSize, shuffle=True, pin_memory=True, num_workers=4)

    return train_loader, test_loader