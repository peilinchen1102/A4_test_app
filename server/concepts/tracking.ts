import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface ItemDoc extends BaseDoc {
  item: string;
  count: number;
}

export default class TrackingConcept {
  public readonly items: DocCollection<ItemDoc>;

  /**
   * Make an instance of Tracking.
   */
  constructor(collectionName: string) {
    this.items = new DocCollection<ItemDoc>(collectionName);
  }

  async create(item: string, count: number) {
    await this.validItem(item, count);
    await this.isItemUnique(item);

    const _id = await this.items.createOne({ item, count });
    return { msg: "Item added successfully!", item: await this.items.readOne({ _id }) };
  }

  async getItem(name: string) {
    return await this.items.readOne({ name });
  }

  async updateCount(name: string, newCount: number) {
    const item = await this.items.readOne({ name });

    if (item === null) {
      throw new NotFoundError(`Item not found!`);
    }

    await this.items.partialUpdateOne({ name }, { count: newCount });
    return { msg: "Item count updated successfully!" };
  }

  private async isItemUnique(item: string) {
    if (await this.items.readOne({ item })) {
      throw new NotAllowedError(`Item ${item} already exists!`);
    }
  }

  private async validItem(item: string, count: number) {
    if (count < 0) {
      throw new BadValuesError("Inital item count cannot be negative");
    }

    if (item === "") {
      throw new BadValuesError("Item name cannot be empty");
    }
  }
}
